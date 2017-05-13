

import { View } from "./View";

export class Debug extends View
{
	private name = "Debug";
	private number = 0;

	constructor()
	{
		super();
		this.fetchView();
		this.setSource(this);
		this.show();

		setInterval(() => {
			this.number++;
		}, 100);
	}

	private numberOnClick(e : Event)
	{
		e.preventDefault();
		alert("whop");
	}
}
