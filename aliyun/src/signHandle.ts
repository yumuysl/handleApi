const axios = require('axios');
const crypto = require('crypto');


/**
 *@Description:
 *  1. 阿里云SDK的V3版本签名
 *  2. 文档地址：https://help.aliyun.com/zh/sdk/product-overview/v3-request-structure-and-signature?spm=a2c4g.11186623.help-menu-262060.d_0_4_2.73812f7ezLvmwl&scm=20140722.H_2593177._.OR_help-T_cn~zh-V_1#sectiondiv-799-06q-cmn
 **/


/**
 *@Description: 元数据类型定义
 **/
interface api_key {
  methods: string[];
  schemes: string[];
  parameters: {
    [key: string]: any;
  }
}

//请求体的hash值后再Base64编码后的字符串，非get请求
const HashedRequestPayload = (body?:{[key:string]:any})=>{
  if(!!body){
    return crypto.createHash("sha256").update(JSON.stringify(body)).digest("base64");
  }
  //body为空时的值
  return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
}

/**
 *Description: 签名机制
 *@method:  请求方法，GET、POST、PUT、DELETE等
 *@path: 请求路径，如/api/queryUserInfo
 *@query: 请求参数，如name=zhangsan&age=18
 *@body: 请求体，如{name: "zhangsan", age: 18}
 **/
function sign(method: string, path: string, headers: {[key: string]:any}, query: {[key: string]:any}, secretKey:string): string {
  const HTTPRequestMethod = method.toUpperCase() //请求方法，GET、POST、PUT、DELETE等
  //请求路径，如/api/queryUserInfo
  const CanonicalURI = (path:string): string=>{
    const regex = /[^A-Za-z0-9\-_.~]/g;
    return  path.replace(regex, (match) => {
      // 获取字符的 ASCII 码并转十六进制大写
      const hex = match.charCodeAt(0).toString(16)
      return `%${hex}`; // 补足两位
    });
  }
  //请求参数，如name=zhangsan&age=18
  const CanonicalQueryString = (query: {[key: string]: any}): string=>{
    const keyArr: string[] = Object.keys(query).sort();
    if (keyArr.length > 0) {
      return keyArr.map((key) => {
        key = CanonicalURI(key);
        return `${key}=${ query[key] || ''}`;
      }).join("&");
    }
    return ""
  }

  //请求头，如Content-Type:application/json
  const handleHeaders = (headers: {[key: string]: any}) =>{
    let keyArr: string[] = Object.keys(headers).map( item =>  item.toLowerCase()).sort()
    return keyArr.filter(key => key.includes("host") || key.includes("x-acs") || key.includes('content-type'))
  }
  const CanonicalHeaders = (headers?:{[key: string]: any})=>{
    if(!!headers){
      let keyArr: string[] = handleHeaders(headers);
      if(keyArr.length > 0){
        keyArr.forEach( (key:string, index: number)=>{
          Object.keys(headers).forEach( (item)=>{
            if(key === item.toLowerCase()){
              keyArr[index] = key + ":" + headers[item];
            }
          })
        })
        return keyArr.join("\n")
      }
    }
    return ""
  }

  //请求头键名，除Authorization
  const SignedHeaders = (headers:{[key: string]: any})=>{
    let keyArr: string[] = handleHeaders(headers);
    return keyArr.join(";")
  }

  //构造规范化请求
  const CanonicalRequest: string = HTTPRequestMethod + "\n" + CanonicalURI(path) + "\n" + CanonicalQueryString(query) + "\n" + CanonicalHeaders(headers) + "\n" + SignedHeaders(headers) + "\n" + HashedRequestPayload(query);

  //构造待签名字符串
  const SignatureAlgorithm: string  = "ACS3-HMAC-SHA256"  //签名加密方式,固定为ACS3-HMAC-SHA256
  const HashedCanonicalRequest: string = encodeURIComponent(crypto.createHash("sha256").update(CanonicalRequest).digest("base64")); //请求体的hash值后再Base64编码后的字符串
  const StringToSign: string = SignatureAlgorithm + "\n" + HashedCanonicalRequest;

  //计算签名
  const Signature: string = crypto.createHmac("sha256", secretKey).update(StringToSign).digest("base64");

  //将签名返回后加入请求
  return Signature
}


/**
 *@Description:
 *  1. host表示服务地址，服务器在哪里
 *  2. param中，action表示接口名称
 *  3. x-acs-content-sha256表示请求体的hash值后再Base64编码后的字符串
 **/
function request(method: string, host: string, param: {[key: string]: any}, access_key_id: string, access_key_secret: string): Promise<any> {
  const base_url = `https://${host}/`;

  const SignatureAlgorithm  = "ACS3-HMAC-SHA256"  //签名加密方式,固定为ACS3-HMAC-SHA256
  const Signature = ""  //签名机制
  const SignedHeaders = 'host' // 请求头键名，除Authorization

  const headers : {[key: string]: string} = {
    "host": host,
    "x-acs-action": param["action"],
    "x-acs-content-sha256": "",
    "x-acs-date": new Date().toUTCString(),
    "x-acs-signature-nonce": Math.random().toString(36).substring(2),
    "x-acs-version": "2014-05-26",
    "Authorization": `${SignatureAlgorithm}
    Credential=${access_key_id},SignedHeaders=${SignedHeaders},Signature=${Signature}`
  }

  const signData = sign(method, param.action, param, headers, access_key_secret );
  
  return new Promise((resolve, reject) => {
  })
}

const adress = 'ecs.cn-beijing.aliyuncs.com';
const access_key_id = 'test'
const param = {
  "action": "DescribeInstanceAttribute",
  "query": {
    "InstanceId": "i-xxxxxxxxxxxxxxxxx"
  },
  "body": null
}


request('post', adress, param, access_key_id).then((res) => {
  console.log("打印响应结果：", res);
}).catch((err) => {
  console.log("打印错误信息：", err);
})

export {}