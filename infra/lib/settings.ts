export const azureOpenAIApiInstanceName = "kintone-copilot-demo"
export const azureOpenAIEmbeddingApiDeploymentName = "embedding-default"
export const azureOpenAIEmbeddingApiVersion = "2023-05-15"
export const apiIpWhilelist = [
  "103.79.14.0/24", // Cybozu IP https://jp.cybozu.help/general/ja/admin/outbound_ipaddress.html
  "202.210.220.64/28", // SCグローバルIP
  "39.110.232.32/28", // SCグローバルIP
  "118.238.251.130", // SCグローバルIP
]
export const dataDir = "/mnt/data"
