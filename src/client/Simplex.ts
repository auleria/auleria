let simplex = require("simplex-noise") as any;

export class Simplex
{
	private simplex : any;

	constructor(prng : any = Math.random)
	{
		this.simplex = new simplex(prng);
	}

	public noise2D(x:number, y:number) : number
	{
		return this.simplex.noise2D(x, y);
	}

	public noise3D(x:number, y:number, z:number) : number
	{
		return this.simplex.noise3D(x, y, z);
	}

	public noise4D(x:number, y:number, z:number, w:number) : number
	{
		return this.simplex.noise4D(x, y, z, w);
	}
}
