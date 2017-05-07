
import { ExternalWindow } from "./ExternalWindow";
import * as D3 from "d3";
import { ISection } from "../Profiler";

export class ProfileWindow extends ExternalWindow
{
	private root : ISection;
	private context : CanvasRenderingContext2D;

	constructor(root : ISection)
	{
		super("", "Auleria Perfomance Profile", "chrome=yes,width=700,height=400,centerscreen=1");

		let canvas = this.document.createElement("canvas");
		let context = canvas.getContext("2d");

		this.body.appendChild(canvas);

		this.root = root;
		this.context = context;
		this.drawSection(root, 0);
	}

	private drawSection(section : ISection, depth : number)
	{
		let rcol = () => Math.floor(Math.random() * 255);
		this.context.fillStyle = `rgb(${rcol()}, ${rcol()}, ${rcol()})`;
		this.context.fillRect(0, depth * 21, section.avgTime * (200 / this.root.avgTime), 20);
		section.children.forEach((s) => this.drawSection(s, depth + 1));
	}
}
