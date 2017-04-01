
export class Classes
{
	private static classes = new Map<string, IClassMeta>();
	public static register(targetClass : any)
	{
		Classes.classes.set(targetClass.name, targetClass);
	}

	public static getClass(name : string) : any
	{
		return Classes.classes.has(name) ? Classes.classes.get(name).type : null;
	}
}

interface IClassMeta
{
	name : string;
	type : any;
}
