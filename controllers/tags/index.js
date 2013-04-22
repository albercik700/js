var TagsController = Composer.Controller.extend({
	elements: {
		'ul.tags': 'tag_list'
	},

	events: {
	},

	project: null,
	tags: null,

	init: function()
	{
		this.project	=	this.profile.get_current_project();
		if(!this.project) return false;
		this.tags	=	new TagsFilter(this.project.get('tags'), {
			filter: function(m) { return true; },
			sortfn: function(a, b) {
				var diff = b.get('count') - a.get('count');
				// secondary alpha sort
				if(diff == 0) diff = a.get('name').localeCompare(b.get('name'));
				return diff;
			}
		});
		this.tags.bind('change', function() {
			this.tags.sort();
		}.bind(this), 'tags:listing:monitor_sort');

		// track all changes to our sub-controllers
		this.setup_tracking(this.tags);

		//this.tags.bind(['change:selected', 'change:excluded'], this.gray_tags.bind(this), 'tags:listing:gray_disabled');
		this.render();
	},

	release: function()
	{
		if(this.tags)
		{
			this.tags.unbind(['change:selected', 'change:excluded'], 'tags:listing:gray_disabled');
			this.tags.unbind('change', 'tags:listing:monitor_sort');
		}
		this.parent.apply(this, arguments);
	},

	render: function()
	{
		var content = Template.render('tags/index', {});
		this.html(content);
	},

	create_subcontroller: function(tag)
	{
		return new TagItemController({
			inject: this.tag_list,
			model: tag
		});
	},

	gray_tags: function()
	{
		// yuck. maybe pass in controller?
		var notes = tagit.controllers.pages.cur_controller.notes_controller.filter_list;
		console.log('gray tags', notes);
		if(!notes) return;
		notes = notes.models();
		var tags = this.tags.models();
		for(var x in tags)
		{
			var tag = tags[x];
			if(!tag.get) continue;
			tag.unset('disabled');
			var enabled = false;
			for(var y in notes)
			{
				var note = notes[y];
				if(note.has_tag && note.has_tag(tag.get('name')))
				{
					enabled = true;
					break;
				}
			}
			if(!enabled)
			{
				tag.set({disabled: true});
			}
		}
	}
}, TrackController);