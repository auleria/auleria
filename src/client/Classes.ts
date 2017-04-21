
export class Classes
{
	private static classes = new Map<string, any>();
	/**
	 * Registers a class to let the engine instantiate them at runtime.
	 * Used when instancing from a buffer, from a server or a client
	 * @static
	 * @param {*} targetClass
	 *
	 * @memberOf Classes
	 */
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
