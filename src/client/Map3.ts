
export class Map3<Tx, Ty, Tz, Tv>
{
	private mapZ = new Map<Tz, Map<Ty, Map<Tx, Tv>>>();

	public get size() {
		let res = 0;
		this.mapZ.forEach(mapY => mapY.forEach(mapX => res += mapX.size));
		return res;
	};

	public get(x: Tx, y: Ty, z:Tz) : Tv
	{
		let mapY = this.mapZ.get(z);
		if (!mapY)
		{
			mapY = new Map<Ty, Map<Tx, Tv>>();
			this.mapZ.set(z, mapY);
		}

		let mapX = mapY.get(y);
		if (!mapX)
		{
			mapX = new Map<Tx, Tv>();
			mapY.set(y, mapX);
		}

		return mapX.get(x);
	}

	public set(x: Tx, y:Ty, z: Tz, value: Tv)
	{
		let mapY = this.mapZ.get(z);
		if (!mapY)
		{
			mapY = new Map<Ty, Map<Tx, Tv>>();
			this.mapZ.set(z, mapY);
		}

		let mapX = mapY.get(y);
		if (!mapX)
		{
			mapX = new Map<Tx, Tv>();
			mapY.set(y, mapX);
		}

		mapX.set(x, value);
	}

	public forEach(callback: (value : Tv, x?: Tx, y?: Ty, z?: Tz) => void)
	{
		this.mapZ.forEach((mapY, z) => mapY.forEach((mapX, y) => mapX.forEach((value, x) => callback(value, x, y, z))));
	}
}
