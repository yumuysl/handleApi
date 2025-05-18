const headers = {
  "Host": "ecs.cn-shanghai.aliyuncs.com",
  "Content-type": "application/x-www-form-urlencoded",
  "x-acs-action": "RunInstances",
  "x-acs-content-sha256":
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "x-acs-date": "2023-10-26T10:22:32Z",
  "x-acs-signature-nonce": "3156853299f313e23d1673dc12e1703d",
  "x-acs-version": "2014-05-26",
};

let key_list = Object.keys(headers).map(key=>key.toLowerCase()).sort();

key_list = key_list.filter(key=> key.includes("x-acs-") || key.includes("content-type") || key.includes("host"));
console.log("已排序待过滤：", key_list);

key_list.forEach( (key, index)=>{
  Object.keys(headers).forEach( (item, i)=>{
    if(key === item.toLowerCase()){
      key_list[index] = key + ":" + headers[item];
      console.log("替换后：", key);
    }
  })
})

console.log("最终：", key_list.join("\n"));