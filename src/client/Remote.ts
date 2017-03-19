enum DIRECTION {BI, SLAVE_TO_MASTER, MASTER_TO_SLAVE};

export class Remote
{
	public static DIRECTION = DIRECTION;
	private static list = new Map<string, Array<string>>();

	public static bi(targetClass : any, property : string)
	{
		Remote.set(targetClass, property, DIRECTION.BI);
	}

	public static slave(targetClass : any, property : string)
	{
		Remote.set(targetClass, property, DIRECTION.SLAVE_TO_MASTER);
	}

	public static master(targetClass : any, property : string)
	{
		Remote.set(targetClass, property, DIRECTION.MASTER_TO_SLAVE);
	}

	public static getRemotes(target : any)
	{
		return Remote.list.get(target.constructor.name) || null;
	}

	private static set(targetClass : any, property : string, type : DIRECTION)
	{
		console.log("Keeping track of", property, "in all instances of type", targetClass.constructor.name);
		let properties = Remote.list.get(targetClass.constructor.name) || new Array<string>();
		properties.push(property);
		Remote.list.set(targetClass.constructor.name, properties);
	}
}
