
export class StatsHandler
{
	private static stats: Stats;

	public static initialize () {
		this.stats = new Stats();
		this.stats.showPanel(0);
		document.body.appendChild(this.stats.dom);

		this.stats.begin();
		requestAnimationFrame(() => this.handleFrame());
	}

	private static handleFrame () {
		requestAnimationFrame(() => this.handleFrame());
		this.stats.end();
		this.stats.begin();
	}
}