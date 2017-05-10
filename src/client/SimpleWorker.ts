
import { Helper } from "./Helper";

export class SimpleWorker
{
	private functions = new Map<string, string>();
	private blob : string;
	private worker : Worker;
	private jobs = new Map<string, Function>();

	constructor(fn : Function, prep? : Function)
	{
		prep = prep || function() { };
		let body = "";
		body += prepare.toString();
		body += run.toString();
		body += `self.root = "${location.origin}";`;
		body += `var userPrep = (${prep.toString()});`;
		body += `var fn = (${fn.toString()});`;
		body += "prepare()";
		this.blob = URL.createObjectURL(new Blob([body]));
		this.worker = new Worker(this.blob);
		this.worker.onmessage = (msg) => this.handleMessage(msg);
	}

	private handleMessage(msg : MessageEvent)
	{
		if (msg.data.done)
		{
			let id = msg.data.id;
			let resolve = this.jobs.get(id);
			this.jobs.delete(id);
			resolve(msg.data.result);
		}
	}

	public async queue(...args : any[])
	{
		return new Promise((resolve, reject) => {
			let id = Helper.generateID();
			this.jobs.set(id, resolve);
			this.worker.postMessage({run: true, args, id});
		});
	}
}

var fn : Function;
var userPrep : Function;
function prepare()
{
	userPrep();
	onmessage = (msg) => {
		if (msg.data.run)
		{
			let result = run(msg.data.args);
			self.postMessage({result: result, done : true, id: msg.data.id}, result.__transfer || []);
		}
	};
}
function run(args : any[] = [])
{
	return fn(...args);
}
