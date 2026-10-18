FROM node:22-alpine
ENV NODE_ENV=production PORT=3004
WORKDIR /app
COPY --chown=node:node package.json server.js ./

USER node
EXPOSE 3004
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=5 CMD node -e "fetch('http://127.0.0.1:3004/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
