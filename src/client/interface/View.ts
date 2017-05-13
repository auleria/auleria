

export class View
{
	protected viewHTML : string;
	protected shadowDOM : ShadowRoot = null;
	private host : HTMLElement = null;
	private source : any = null;
	private boundElements = new Array<{name: string, events: {name: string, callback: string}[], element: HTMLElement}>();
	private isVisible : boolean = false;

	public setSource(source : any)
	{
		this.source = source;
		this.updateBindings();
	}

	private updateBoundProperty(name : string, value : any)
	{
		let node = this.boundElements.find(n => n.name === name);
		if (node)
		{
			node.element.innerHTML = value;
		}
		return value;
	}

	private forceUpdate()
	{
		if (this.source)
		{
			for (var name in this.source.__bound)
			{
				this.updateBoundProperty(name, this.source.__bound[name]);
			}
		}
	}

	private updateBindings()
	{
		let source = this.source as {__bound:{[key:string]:any}, [key:string]:any};
		if (this.source && this.shadowDOM && !source.__bound)
		{
			this.boundElements.forEach(be => {
				if (source.hasOwnProperty(be.name))
				{
					source.__bound = source.__bound || {};
					source.__bound[be.name] = source[be.name];
					delete source[be.name];
					Object.defineProperty(source, be.name, {
						get: () => source.__bound[be.name],
						set: (value) => source.__bound[be.name] = this.updateBoundProperty(be.name, value)
					});
				}
				if (be.events)
				{
					be.events.forEach(event => {
						be.element.addEventListener(event.name, (e : Event) => this.triggerEvent(event.callback, e));
					});
				}
			});
		}
	}

	protected getBinding(name : string)
	{
		return this.boundElements.find(e => e.name === name);
	}

	private triggerEvent(eventName : string, e : Event)
	{
		if ((this as any)[eventName])
		{
			(this as any)[eventName](e);
		}
	}

	public async fetchView()
	{
		let viewname = this.constructor.name;
		let html = await fetch("/bin/views/" + viewname + ".html").then(r => r.text());
		this.host = document.querySelector("#shadowHost").appendChild(document.createElement("div"));
		this.shadowDOM = this.host.attachShadow({mode : "open"});
		this.shadowDOM.innerHTML = html;

		this.boundElements = Array.from(this.shadowDOM.querySelectorAll("[bind]")).map(element => {
			let eventAttributes = Array.from(element.attributes).filter((a) => a.name.startsWith("bind-"));
			let res = {
				name: element.getAttribute("bind"),
				events: eventAttributes.map(a => ({name: a.name.substr(a.name.indexOf("-") + 1), callback: a.value})),
				element: element as HTMLElement
			};
			return res;
		});
		this.updateBindings();
		this.forceUpdate();

		this.host.style.display = "none";
		this.host.style.position = "absolute";
		this.host.style.left = "0";
		this.host.style.top = "0";

		if (this.isVisible)
		{
			this.show();
		}
	}

	public show()
	{
		if (this.shadowDOM)
		{
			this.host.style.display = "block";
		}
		this.isVisible = true;
	}

	public hide()
	{
		if (this.shadowDOM)
		{
			this.host.style.display = "none";
		}
		this.isVisible = false;
	}

	public destroy()
	{
		this.hide();
		this.shadowDOM = null;
	}
}
