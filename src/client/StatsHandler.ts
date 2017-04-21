
export class StatsHandler
{
	private static stats: Stats;

	public static initialize () {
		this.stats = new Stats();
		this.stats.begin();
		requestAnimationFrame(this.endCount);
	}

	private static endCount () {
		requestAnimationFrame(this.endCount);
		this.stats.end();
		this.stats.begin();
	}
}