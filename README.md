![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-openaiphotoedit

OpenAI Photo Edit node for n8n, a powerful workflow automation tool.
This node allows you to use OpenAI's [Image Generation](https://platform.openai.com/docs/guides/image-generation) to create a styled version of your photo.

Avaliable options are:
- **Chibi**: Generate a chibi-style image.
- **Pixel Art**: Generate a pixel art-style image.
- **Cartoon**: Generate a cartoon-style image.

<img width="1920" height="879" alt="image" src="https://github.com/user-attachments/assets/928cd2ce-9bc1-4d43-8e3f-486ff2b83ff3" />


## Installation
This node is intended for learning how to create custom nodes for n8n. To use it, you need to clone the repository and install the dependencies.

Although, you can use it in production following the steps below:
1. Clone the repository:
   ```bash
   git clone https://github.com/uluumbch/n8n-nodes-openaiphotoedit.git
   ```
2. Navigate to the cloned directory:
   ```bash
   cd n8n-nodes-openaiphotoedit
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Use this docker compose as reference to run the node:
   ```yaml
    services:
      caddy:
        image: caddy:latest
        restart: unless-stopped
        ports:
          - "80:80"
          - "443:443"
        volumes:
          - caddy_data:/data
          - ${DATA_FOLDER}/caddy_config:/config
          - ${DATA_FOLDER}/caddy_config/Caddyfile:/etc/caddy/Caddyfile

      n8n:
        image: docker.n8n.io/n8nio/n8n
        restart: always
        ports:
          - 5678:5678
        environment:
          - N8N_HOST=${SUBDOMAIN}.${DOMAIN_NAME}
          - N8N_PORT=5678
          - N8N_PROTOCOL=https
          - NODE_ENV=production
          - WEBHOOK_URL=https://${SUBDOMAIN}.${DOMAIN_NAME}/
          - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
          - N8N_CUSTOM_EXTENSIONS_DIR=/home/node/.n8n/custom
        volumes:
          - n8n_data:/home/node/.n8n
          - ${DATA_FOLDER}/local_files:/files
          - ${DATA_FOLDER}/n8n_custom_nodes:/home/node/.n8n/custom
          
    volumes:
      caddy_data:
        external: true
      n8n_data:
        external: true
   ```
6. Add the node to your n8n custom nodes directory:
   ```bash
   cp -r dist/* ${DATA_FOLDER}/n8n_custom_nodes/
   ```

> refer to the [n8n documentation](https://docs.n8n.io/hosting/installation/server-setups/digital-ocean) for more details on how to set up n8n deploymenyt using docker compose.
## License

[MIT](./LICENSE.md)
