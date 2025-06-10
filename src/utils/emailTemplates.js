export const ticketNotificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>New Ticket Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f8fafc;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 0 0 5px 5px;
        }
        .ticket-details {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            font-size: 0.9em;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #64748b;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Ticket Notification</h1>
    </div>
   
    <div class="content">
        <p>Dear {{to_name}},</p>
       
        <p>You have received a new ticket.</p>
       
        <div class="ticket-details">
            <p><strong>Ticket Number:</strong> {{ticket_id}}</p>
            <p><strong>From:</strong> {{reply_from}}</p>
            <p><strong>Contact Number:</strong> {{phone}}</p>
        </div>
    </div>
   
    <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
    </div>
</body>
</html>
`;
 
export const ticketAssignmentTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Ticket Assigned</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f8fafc;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 0 0 5px 5px;
        }
        .ticket-details {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            font-size: 0.9em;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #64748b;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ticket Assigned to You</h1>
    </div>
   
    <div class="content">
        <p>Dear {{to_name}},</p>
       
        <p>A new ticket has been assigned to you.</p>
       
        <div class="ticket-details">
            <p><strong>Ticket Number:</strong> {{ticket_id}}</p>
            <p><strong>Assigned By:</strong> {{assigned_by_name}}</p>
            <p><strong>Customer Name:</strong> {{customer_name}}</p>
            <p><strong>Customer Contact:</strong> {{customer_phone}}</p>
        </div>
    </div>
   
    <div class="footer">
        <p>This is an automated message.</p>
    </div>
</body>
</html>
`;
 