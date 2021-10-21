frappe.listview_settings['Staff'] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if (["Left"].includes(doc.status)) {
			// Closed
			return [__(doc.status), "black", "status,=," + doc.status];
		} else if (doc.status === "Completed") {
			// Closed
			return [__(doc.status), "green", "status,=," + doc.status];
		}

	},
};