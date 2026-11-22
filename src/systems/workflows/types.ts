export type WorkflowFieldType="text"|"textarea"|"email"|"tel"|"url"|"number"|"select"|"multiselect"|"checkbox"|"toggle"|"file"|"image"|"currency";
export type WorkflowField={id:string;label:string;type:WorkflowFieldType;required?:boolean;placeholder?:string;helper?:string;options?:Array<{label:string;value:string}>;min?:number;max?:number;accept?:string};
export type WorkflowStep={id:string;title:string;description?:string;fields:WorkflowField[]};
export type WorkflowDefinition={id:string;title:string;description:string;category:"account"|"commerce"|"business"|"operations"|"support";version:number;steps:WorkflowStep[];submitLabel?:string};
export type WorkflowValues=Record<string,unknown>; export type WorkflowErrors=Record<string,string>;
export type WorkflowDraft={workflowId:string;version:number;step:number;values:WorkflowValues;updatedAt:string};