frappe.listview_settings['Timesy'] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if (["In Progress"].includes(doc.status)) {
			// Closed
			return [__(doc.status), "orange", "status,=," + doc.status];
		} else if (doc.status === "Completed") {
			// Closed
			return [__(doc.status), "green", "status,=," + doc.status];
		}

	},
};