

export class View
{
	protected viewHTML : string;
	protected shadowDOM : ShadowRoot = null;
	private host : HTMLElement = null;
	public async fetchView()
	{
		let viewname = __filename.replace(/^.*[\\\/]/, "").replace(/.ts$/, "");
		let html = await fetch("/bin/views/" + viewname + ".html").then(r => r.text());
		this.host = document.querySelector("#shadowHost").appendChild(document.createElement("div"));
		this.shadowDOM = this.host.attachShadow({mode : "open"});
		this.shadowDOM.innerHTML = html;
		this.host.style.display = "none";
		this.host.style.position = "absolute";
		this.host.style.left = "0";
		this.host.style.top = "0";
	}

	public show()
	{
		if (this.shadowDOM)
		{
			this.host.style.display = "block";
		}
	}

	public hide()
	{
		if (this.shadowDOM)
		{
			this.host.style.display = "none";
		}
	}

	public destroy()
	{
		this.hide();
		this.shadowDOM = null;
	}
}
