import React from "react";
import type {WorkflowField,WorkflowValues,WorkflowErrors} from "../types";
type Props={field:WorkflowField;values:WorkflowValues;errors:WorkflowErrors;onChange:(id:string,value:unknown)=>void};
export default function WorkflowFieldRenderer({field,values,errors,onChange}:Props){
 const value=values[field.id];const error=errors[field.id];const base="swf-input";const update=(v:unknown)=>onChange(field.id,v);
 const control=field.type==="textarea"?<textarea className={base} rows={4} placeholder={field.placeholder} value={String(value??"")} onChange={e=>update(e.target.value)}/>:
 field.type==="select"?<select className={base} value={String(value??"")} onChange={e=>update(e.target.value)}><option value="">Choose…</option>{field.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:
 field.type==="multiselect"?<div className="swf-options">{field.options?.map(o=><div key={o.value} className="swf-option"><input type="checkbox" checked={Array.isArray(value)&&value.includes(o.value)} onChange={e=>update(e.target.checked?[...(Array.isArray(value)?value:[]),o.value]:(Array.isArray(value)?value:[]).filter(x=>x!==o.value))}/><span>{o.label}</span></div>)}</div>:
 field.type==="toggle"||field.type==="checkbox"?<span className="swf-toggle"><input type="checkbox" checked={Boolean(value)} onChange={e=>update(e.target.checked)}/></span>:
 field.type==="file"||field.type==="image"?<input className={base} type="file" accept={field.accept||(field.type==="image"?"image/*":undefined)} multiple={false} onChange={e=>update(e.target.files?.[0]??null)}/>:
 <input className={base} type={field.type==="currency"?"number":field.type} min={field.min} max={field.max} placeholder={field.placeholder} value={String(value??"")} onChange={e=>update(field.type==="number"||field.type==="currency"?(e.target.value===""?"":Number(e.target.value)):e.target.value)}/>;
 return <div className="swf-field"><label className="swf-label" htmlFor={field.id}>{field.label}{field.required&&<b> *</b>}</label>{React.cloneElement(control as React.ReactElement,{id:field.id})}{field.helper&&<small className="swf-help">{field.helper}</small>}{error&&<small className="swf-error" role="alert">{error}</small>}</div>;
}