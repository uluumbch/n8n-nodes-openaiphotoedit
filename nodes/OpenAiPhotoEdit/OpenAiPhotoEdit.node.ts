import { Buffer } from 'buffer';
import {
    // IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
    NodeExecutionWithMetadata,
    IRequestOptions,
    NodeOperationError,
} from 'n8n-workflow';

import { OpenAiPhotoEditPrompt } from './OpenAiPhotoEditPrompt';
import { writeDebugLog } from './logger';
const { chibi, pixelart, cartoon } = OpenAiPhotoEditPrompt;

export class OpenAiPhotoEdit implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'OpenAI Photo Edit',
        name: 'openAiPhotoEdit',
        icon: 'file:openAiPhotoEdit.svg',
        group: ['transform'],
        version: 1,
        description: 'Edit photos using OpenAI API',
        defaults: {
            name: 'OpenAI Photo Edit',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'openAiApi',
                required: true,
            }
        ],
        properties: [
            {
                displayName: 'Style',
                name: 'style',
                type: 'options',
                options: [
                    {
                        name: 'Chibi',
                        value: 'chibi',
                    },
                    {
                        name: 'Pixel Art',
                        value: 'pixelart',
                    },
                    {
                        name: 'Cartoon',
                        value: 'cartoon',
                    },
                ],
                default: 'chibi',
                description: 'Choose the style of the photo edit',
                required: true,
                noDataExpression: true,
            },
            {
                displayName: 'Image Source',
                name: 'imageSource',
                type: 'options',
                options: [
                    {
                        name: 'Binary Data (Form Upload)',
                        value: 'binary',
                        description: 'Use image from form upload or previous node binary data',
                    },
                    {
                        name: 'Base64 String',
                        value: 'base64',
                        description: 'Paste base64 encoded image data directly',
                    },
                ],
                default: 'binary',
                description: 'Choose how to provide the image data',
                required: true,
                noDataExpression: true,
            },
            {
                displayName: 'Binary Property Name',
                name: 'binaryPropertyName',
                type: 'string',
                default: 'data',
                description: 'Name of the binary property containing the image data',
                placeholder: 'e.g. data, image, file',
                displayOptions: {
                    show: {
                        imageSource: ['binary'],
                    },
                },
                required: true,
            },
            {
                displayName: 'Base64 Image Data',
                name: 'base64Image',
                type: 'string',
                typeOptions: {
                    alwaysOpenEditWindow: true,
                    rows: 4,
                },
                default: '',
                placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
                description: 'Paste the complete base64 image data including the data:image prefix',
                displayOptions: {
                    show: {
                        imageSource: ['base64'],
                    },
                },
                required: true,
            }
        ]
    };

    // execute method to process the input data
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
        const items = this.getInputData();
        const returnData = [];

        for (let i = 0; i < items.length; i++) {
            const style = this.getNodeParameter('style', i) as string;
            const imageSource = this.getNodeParameter('imageSource', i) as string;
            const binaryPropertyName = imageSource === 'binary' ? this.getNodeParameter('binaryPropertyName', i, 'data') as string : 'data';
            const base64ImageParam = imageSource === 'base64' ? this.getNodeParameter('base64Image', i, '') as string : '';


            // Get the prompt based on style
            let prompt = '';
            switch (style) {
                case 'chibi':
                    prompt = chibi;
                    break;
                case 'pixelart':
                    prompt = pixelart;
                    break;
                case 'cartoon':
                    prompt = cartoon;
                    break;
                default:
                    prompt = chibi;
            }

            // Handle different image input types
            let imageBuffer: Buffer;
            let base64Image: string;


            try {
                if (imageSource === 'binary') {
                    // Handle binary data from form upload or previous nodes
                    const binaryData = items[i].binary?.[binaryPropertyName];
                    if (!binaryData) {
                        throw new NodeOperationError(
                            this.getNode(),
                            `No binary data found with property name: ${binaryPropertyName}. Available properties: ${Object.keys(items[i].binary || {}).join(', ')}`
                        );
                    }
                    imageBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                    // convert to base64 string
                    const base64Data = imageBuffer.toString('base64');
                    console.log(`Binary data loaded for item ${i}, size: ${imageBuffer.length} bytes`);
                    // Prepend the data:image prefix
                    base64Image = `data:${binaryData.mimeType};base64,${base64Data}`;

                } else if (imageSource === 'base64') {
                    // Handle base64 string input
                    if (!base64ImageParam || !base64ImageParam.startsWith('data:image/')) {
                        throw new NodeOperationError(
                            this.getNode(),
                            'Base64 image must start with "data:image/" prefix (e.g., data:image/jpeg;base64,...)'
                        );
                    }
                    const base64Data = base64ImageParam.split(',')[1];
                    if (!base64Data) {
                        throw new NodeOperationError(
                            this.getNode(),
                            'Invalid base64 format. Expected format: data:image/jpeg;base64,<base64-data>'
                        );
                    }
                    imageBuffer = Buffer.from(base64Data, 'base64');
                    base64Image = base64ImageParam;
                    console.log(`Base64 data loaded for item ${i}, size: ${imageBuffer.length} bytes`);

                } else {
                    throw new NodeOperationError(this.getNode(), `Unknown image source: ${imageSource}`);
                }

            } catch (error) {
                throw new NodeOperationError(this.getNode(), `Error processing image: ${error.message}`);
            }

            // Prepare form data for multipart/form-data request
            const formData = {
                model: 'gpt-4o-mini',
                tools: [
                    {
                        'type': 'image_generation',
                        'quality': 'low',
                        'size': '1024x1024',
                    }
                ],
                input: [
                    {
                        'role': 'user',
                        'content': [
                            { 'type': 'input_text', 'text': `${prompt}` },
                            { 'type': 'input_image', 'image_url': base64Image },
                        ],
                    }
                ]
            };

            // Get credentials
            const credentials = await this.getCredentials('openAiApi');
            const requestOptions: IRequestOptions = {
                method: 'POST',
                url: 'https://api.openai.com/v1/responses',
                headers: {
                    'Authorization': `Bearer ${credentials.apiKey}`,
                },
                body: formData,
                json: true,
            };

            try {
                const response = await this.helpers.request(requestOptions);

                writeDebugLog({
                    executionIndex: i,
                    responseStructure: {
                        hasData: !!response.data,
                        responseKeys: Object.keys(response || {}),
                        responseId: response.id,
                        status: response.status,
                        outputLength: response.output?.length || 0
                    }
                });

                // Process the response based on the actual structure
                if (response.output && response.output.length > 0) {
                    // Find the image generation result in the output array
                    const imageGeneration = response.output.find((item: any) => item.type === 'image_generation_call');
                    const messageOutput = response.output.find((item: any) => item.type === 'message');

                    if (imageGeneration && imageGeneration.result) {
                        // Convert base64 to binary data
                        const responseImageBuffer = Buffer.from(imageGeneration.result, 'base64');

                        returnData.push({
                            json: {
                                style: style,
                                prompt: prompt,
                                revised_prompt: imageGeneration.revised_prompt || '',
                                success: true,
                                imageSource: imageSource,
                                responseId: response.id,
                                model: response.model,
                                imageGenerationId: imageGeneration.id,
                                imageSize: imageGeneration.size,
                                imageQuality: imageGeneration.quality,
                                imageFormat: imageGeneration.output_format,
                                usage: response.usage,
                                assistantMessage: messageOutput?.content?.[0]?.text || ''
                            },
                            binary: {
                                data: await this.helpers.prepareBinaryData(
                                    responseImageBuffer,
                                    `edited_image_${style}_${Date.now()}.png`,
                                    'image/png'
                                ),
                            },
                        });

                        writeDebugLog({
                            executionIndex: i,
                            message: 'Successfully processed image',
                            imageSize: responseImageBuffer.length,
                            revised_prompt: imageGeneration.revised_prompt
                        });

                    } else {
                        // No image generation found
                        writeDebugLog({
                            executionIndex: i,
                            error: 'No image generation result found in response',
                            outputTypes: response.output.map((item: any) => item.type)
                        });

                        returnData.push({
                            json: {
                                error: 'No image generation result found in API response',
                                style: style,
                                success: false,
                                imageSource: imageSource,
                                responseId: response.id,
                                outputTypes: response.output.map((item: any) => item.type)
                            },
                        });
                    }
                } else {
                    // No output array or empty
                    writeDebugLog({
                        executionIndex: i,
                        error: 'API response missing output array',
                        responseStructure: response
                    });

                    returnData.push({
                        json: {
                            error: 'API response missing output data',
                            style: style,
                            success: false,
                            imageSource: imageSource,
                            responseId: response.id || 'unknown'
                        },
                    });
                }

            } catch (error) {
                writeDebugLog({
                    executionIndex: i,
                    error: error.message,
                    errorStack: error.stack,
                    requestUrl: requestOptions.url,
                    requestMethod: requestOptions.method
                }, 'openai-api-errors.log');

                returnData.push({
                    json: {
                        error: error.message,
                        style: style,
                        success: false,
                        imageSource: imageSource,
                        errorType: 'api_request_failed'
                    },
                });
            }
        }

        return [returnData];
    }
}