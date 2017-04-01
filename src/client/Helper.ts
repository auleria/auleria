let randtoken = require("rand-token");

export class Helper
{
	public static readonly ID_SIZE = 8;

	public static generateID() : string
	{
		return randtoken.generate(Helper.ID_SIZE);
	}

	public static sealed(target: any, property: string)
	{
		Object.seal(target[property]);
	}
}
