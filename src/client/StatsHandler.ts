
export class StatsHandler
{
	private static stats: Stats;

	public static initialize () {
		this.stats = new Stats();
		this.stats.showPanel(0);
		document.body.appendChild(this.stats.dom);
	}

	public static begin()
	{
		if (this.stats)
		{
			this.stats.begin();
		}
	}

	public static end()
	{
		if (this.stats)
		{
			this.stats.end();
		}
	}
}
