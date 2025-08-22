export function Field({ label, children }:{label:string; children:any}) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      {children}
    </label>
  );
}
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"border p-2 w-full rounded-xl "+(props.className||"")} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={"border p-2 w-full rounded-xl "+(props.className||"")} />;
}
export function Checkbox({label, ...props}:{label:string} & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="inline-flex items-center gap-2"><input type="checkbox" {...props} /> <span className="text-sm">{label}</span></label>;
}

