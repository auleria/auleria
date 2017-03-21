import { Remote } from "../../Remote";
import { GameObject } from "../../GameObject";

export class DebugObject extends GameObject
{
	@Remote.monitor(Remote.DIRECTION.BI)
	public name : string;

	constructor(name : string = "Hank")
	{
		super();
		this.name = name;
	}

	public initialize(): void {
		console.log("Debug object created! :D");
	}

	public masterUpdate(): void {
		throw new Error('Method not implemented.');
	}

	public slaveUpdate(): void {
		throw new Error('Method not implemented.');
	}

	public destroy(): void {
		throw new Error('Method not implemented.');
	}
}
