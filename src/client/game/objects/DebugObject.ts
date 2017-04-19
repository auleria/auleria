import { Remote } from "../../Remote";
import { GameObject } from "../../GameObject";
import { ByteBuffer } from "../../ByteBuffer";
import { Classes } from "../../Classes";

@Classes.register
export class DebugObject extends GameObject
{
	public name : string;
	private changedName = false;
	private text : HTMLDivElement;
	private x : number;

	private over : boolean;

	constructor(name : string = "Hankerino")
	{
		super();
		this.name = name;
	}

	public initialize(): void {
		if (this.isMaster)
		{
			this.x = Math.random() * Math.PI * 2;
		}
		else
		{
			this.text = document.createElement("div");
			this.text.innerHTML = this.name;
			this.text.style.width = "200px";
			document.body.appendChild(this.text);

			this.text.onmouseover = () => {
				this.name = this.world.me;
				this.changedName = true;
			};
		}
	}

	public writeToBuffer(buffer : ByteBuffer, forced : boolean)
	{
		if (this.isMaster || forced)
		{
			if (forced || this.changedName)
			{
				buffer.writeByte(1);
				buffer.writeString(this.name);
				this.changedName = false;
			}
			else
			{
				buffer.writeByte(0);
			}

			buffer.writeFloat(this.x);
			return true;
		}
		else
		{
			if (this.changedName)
			{
				buffer.writeString(this.name);
				return true;
			}
			return false;
		}
	}

	public readFromBuffer(buffer : ByteBuffer, forced : boolean = false)
	{
		if (!this.isMaster)
		{
			let namechange = buffer.readByte() === 1;
			if (forced || namechange)
			{
				this.name = buffer.readString();
			}
			this.x = buffer.readFloat();
		}
		else
		{
			this.name = buffer.readString();
			this.changedName = true;
		}
	}

	public tick(): void {
		this.x += 0.1;
	}

	public update(): void {
		this.text.style.transform = "translateX(" + (Math.sin(this.x) * 10) + "px)";
		this.text.style.background = this.over ? "red" : "transparent";
		this.text.innerHTML = this.name;
	}

	public postUpdate() : void
	{
		if (this.changedName)
		{
			this.changedName = false;
		}
	}

	public destroy(): void {
		throw new Error('Method not implemented.');
	}
}
