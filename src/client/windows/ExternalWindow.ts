
export class ExternalWindow
{
	protected window : Window;
	protected document : HTMLDocument;
	protected body : HTMLBodyElement;

	constructor(url : string, title : string, features : string)
	{
		this.window = window.open(url, title, features);
		this.document = this.window.document;
		this.body = this.document.body as HTMLBodyElement;
	}
}
