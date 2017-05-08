
export class Profiler
{
	private static current : ISection = null;
	private static _top : ISection;

	public static get top() { return this._top; }

	public static initialize()
	{
		this.current = {
			parent : null,
			name : "root",
			totalTime : -1,
			begin : -1,
			avgTime : 0,
			count : 0,
			end : -1,
			children : new Map<string, ISection>()
		};

		this._top = this.current;
	}

	public static begin(name : string)
	{
		let now = performance.now();
		let section = this.current.children.get(name);
		if (!section)
		{
			section = {
				parent: this.current,
				name : name,
				totalTime : 0,
				begin : now,
				avgTime : 0,
				count : 0,
				end : 0,
				children : new Map<string, ISection>()
			};
		}

		section.begin = now;

		this.current.children.set(name, section);
		this.current = section;
	}

	public static end()
	{
		this.current.end = performance.now();
		this.current.totalTime += this.current.end - this.current.begin;
		this.current.count++;
		this.current.avgTime = this.current.totalTime / this.current.count;
		this.current = this.current.parent;
	}
}

export interface ISection
{
	parent : ISection;
	name : string;
	totalTime : number;
	avgTime : number;
	count : number;
	begin : number;
	end : number;
	children : Map<string, ISection>;
}
