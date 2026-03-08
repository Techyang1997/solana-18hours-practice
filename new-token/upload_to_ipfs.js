const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

const pinata = new pinataSDK('API Key', 'API KeySecret');

async function uploadImageToIPFS(filePath) {
    const readableStreamForFile = fs.createReadStream(filePath);

    // options 对象，指定文件名
    const options = {
        pinataMetadata: {
            name: "metadata.json",
        },
        pinataOptions: {
            cidVersion: 0
        }
    };

    try {
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        const cid = result.IpfsHash;

        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        console.log("上传成功！");
        console.log("CID:", cid);
        console.log("最终 URL:", gatewayUrl);

        return gatewayUrl;
    } catch (error) {
        console.error("上传失败:", error);
    }
}

// 执行上传
uploadImageToIPFS('./metadata.json');