
export class Classes
{
	private static classes = new Map<string, any>();
	public static register(targetClass : any)
	{
		Classes.classes.set(targetClass.name, targetClass);
	}

	public static getClass(name : string) : any
	{
		if (Classes.classes.has(name))
		{
			let constructor = Classes.classes.get(name);
			return constructor;
		}
		else
		{
			throw new Error(name + " is not in the class register, did you forget to do @Classes.register?");
		}
	}
}
