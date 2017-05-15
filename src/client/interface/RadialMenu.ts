import { View } from "./View";

export class RadialMenu extends View
{
	private radialMenu : string;

	constructor()
	{
		super();
		this.fetchView().then(() => this.populateMenu(12));
		this.setSource(this);
		this.show();
	}

	private populateMenu (numberOfItems : number)
	{
		let angle = 2 * Math.PI / numberOfItems;
		let distance = 200;
		let element = this.getBinding("radialMenu").element;

		let center = document.createElement("li");
		let span = document.createElement("span");
		span.innerHTML = "Center";
		span.className += "center";
		center.className += "center";
		center.tabIndex = 20;
		center.appendChild(span);
		element.appendChild(center);

		for (let i = 0; i < numberOfItems; i++)
		{
			let item = document.createElement("li");
			let span = document.createElement("span");
			span.innerHTML = i.toString();
			item.className += "center";
			span.className += "center";
			item.tabIndex = i;
			item.appendChild(span);
			element.appendChild(item);

			item.style.left = Math.round(Math.cos(angle * i) * 50 + 50) + "%";
			item.style.top = Math.round(Math.sin(angle * i) * 50 + 50) + "%";
		}
	}
}
