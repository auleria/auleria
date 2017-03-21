let randtoken = require("rand-token");

export class Helper
{
	private static ID_SIZE = 8;

	public static generateID()
	{
		return randtoken.generate(Helper.ID_SIZE);
	}

	public static sealed(target: any, property: string)
	{
		Object.seal(target[property]);
	}
}