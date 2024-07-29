export type ContextProps = {
  stageKey: string,
  stageName: string,
  deletionProtection: boolean,
  cacheNodeType: string,
  suguresEndpoint: string,
  suguresClientId: string,
  apiManagementEndpoint: string,
  openAIApiInstanceName: string,
  apiIpWhitelist: string[],
  apiMngIpWhitelist: string[],
  pluginId: string,
}