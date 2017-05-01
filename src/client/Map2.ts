
export class Map2<Tx, Ty, Tv>
{
	private mapY = new Map<Ty, Map<Tx, Tv>>();

	public get size() {
		let res = 0;
		this.mapY.forEach(mapX => res += mapX.size);
		return res;
	};

	public get(x: Tx, y: Ty) : Tv
	{
		let mapX = this.mapY.get(y);
		if (!mapX)
		{
			mapX = new Map<Tx, Tv>();
			this.mapY.set(y, mapX);
		}

		return mapX.get(x);
	}

	public set(x: Tx, y:Ty, value: Tv)
	{
		let mapX = this.mapY.get(y);
		if (!mapX)
		{
			mapX = new Map<Tx, Tv>();
			this.mapY.set(y, mapX);
		}

		mapX.set(x, value);
	}

	public forEach(callback: (value : Tv, x?: Tx, y?: Ty) => void)
	{
		this.mapY.forEach((mapX, y) => mapX.forEach((value, x) => callback(value, x, y)));
	}
}
