
export class Classes
{
	private static classes = new Map<string, IClassMeta>();
	public static register(targetClass : any)
	{
		Classes.classes.set(targetClass.name, targetClass);
	}

	public static getClass(name : string)
	{
		return Classes.classes.get(name);
	}
}

interface IClassMeta
{
	name : string;
	type : any;
}
