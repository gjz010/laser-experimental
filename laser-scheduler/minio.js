var Minio = require('minio')

// Instantiate the minio client with the endpoint
// and access keys as shown below.
var minioClient = new Minio.Client({
    endPoint: '10.152.183.130',
    port: 9000,
    useSSL: false,
    accessKey: 'L4WXOJBJ5KI85BRTHB0D',
    secretKey: 'nxZR3e6P+RxMaVYv0h6krOTEsV005TlS+e0axV8+'
});
module.exports=minioClient;
