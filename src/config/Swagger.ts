import swaggerJsdoc from "swagger-jsdoc";

const port = process.env.PORT

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "e commerce API",
            version: "1.0.0",
            description: "API docs for the e commerce backend",
        },
        servers: [
            {
                url: `https://ecommerce-api-bszs.onrender.com`,
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT token",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/Controller/*.ts", "./src/Controller/**/*.ts", "./src/Routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;