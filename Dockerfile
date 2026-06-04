# 1. Base image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm ci

# 5. Copy rest of project
COPY . .

# 5b. Build-time variabler.
# NEXT_PUBLIC_*-variabler inlines i browser-bundlen UNDER "npm run build".
# På Railway (Dockerfile) skal de deklareres som ARG for at være tilgængelige
# under builden. Railway sender service-variablerne ind som build args.
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 6. Build Next.js
RUN npm run build

# 7. Expose port
EXPOSE 3000

# 8. Start the app
CMD ["npm", "start"]
