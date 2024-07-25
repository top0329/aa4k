export interface Prompt {
  prompt: string;
}
export interface PromptFunctionParameter {
  item_id: number;
  parent_item_id: number | null;
  item_name: string;
  item_type: string;
  item_describe: string;
  constants: string;
}

// プロンプト情報
export interface PromptInfo extends Prompt {
  service_div: string,
  prompt: string;
  prompt_function_parameter: PromptFunctionParameter[],
}
