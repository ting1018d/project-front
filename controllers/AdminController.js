import Booking from "../models/booking.js";
import contacts from "../models/Contact.js";

    export const getRecords = (req, res) => {
        Booking.aggregate([
            {
            '$lookup': {
                'from': 'users', 
                'localField': 'userEmail', 
                'foreignField': 'email', 
                'as': 'bookingsInClass'
            }
            }, {
            '$unwind': {
                'path': '$bookingsInClass', 
                'preserveNullAndEmptyArrays': true
            }
            }, {
            '$sort': {
                'facility' :1,
                'bookingDate': 1,
                'session' : 1
            }
            }
      ]).then(records => {
        records.forEach(recordsFormat)        
        function recordsFormat (record, index) {
            record.bookingDate = record.bookingDate.toDateString();
        }
        res.render("admin/records", {records: records})
      });
    }

    export const getInquiries = (req, res) => {
        contacts.aggregate([
        {
          '$lookup': {
            'from': 'admin', 
            'localField': 'user_ID', 
            'foreignField': '_id', 
            'as': 'adminInClass'
          }
        }, {
          '$unwind': {
            'path': '$adminInClass', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$sort': {
            'date': -1
          }
        }
    ]).then(inquiries => {
        console.log(inquiries);
        res.render("admin/inquiries", {inquiries: inquiries})
      });
    }