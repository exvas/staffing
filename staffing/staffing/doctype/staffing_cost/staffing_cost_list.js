frappe.listview_settings['Staffing Cost'] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if (["Expired"].includes(doc.status)) {
			// Closed
			return [__(doc.status), "black", "status,=," + doc.status];
		} else if (doc.status === "Active") {
			// Closed
			return [__(doc.status), "green", "status,=," + doc.status];
		}

	},
};