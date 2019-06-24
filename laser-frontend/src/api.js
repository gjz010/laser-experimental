import SwaggerClient from "swagger-client";
const specUrl = 'https://api.swaggerhub.com/apis/gjz0107/laser-platform/1.0.0-oas3/'; // data urls are OK too 'data:application/json;base64,abc...'

const swaggerClient = new SwaggerClient(specUrl, {"authorizations": {"bearerAuth": ""}});

export default swaggerClient;