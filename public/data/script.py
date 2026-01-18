import json
import re

# The new timeline data provided by the user
new_events_raw = [
    {
        "ID": 12303,
        "CreatedAt": "2026-01-17T03:10:15.118214Z",
        "UpdatedAt": "2026-01-17T03:10:27.494978Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Reminder: PPT and Interview  - Spotnana",
        "description": "<p>Reminder for PPT and Interview for Spotnana is scheduled at 9 am in TB201. It is mandatory for all shortlisted candidates to attend the PPT as interviews will start with after that</p>",
        "tags": "PPT, Interview,Spotnana",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1768619427494,
        "deadline": 0
    },
    {
        "ID": 12300,
        "CreatedAt": "2026-01-16T17:03:21.98338Z",
        "UpdatedAt": "2026-01-16T17:03:26.590561Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Details - Sigmoid Analytics",
        "description": "<p>PFA the shortlist for the test:</p><p><a href=\"https://docs.google.com/spreadsheets/d/1QcHHrlD6D2fVDKQ5-2xkon8iQIhLTthtUxk9xvXyHLI/edit?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://docs.google.com/spreadsheets/d/1QcHHrlD6D2fVDKQ5-2xkon8iQIhLTthtUxk9xvXyHLI/edit?usp=sharing</a></p><p>Please note that the test is scheduled on 18th January, 2026. Some of you may have received test link stating the test date as 17th January, 2026 kindly ignore those.</p><p>Further details regarding the test will be communicated soon.</p>",
        "tags": "Test",
        "attachment": "",
        "created_by": "ac.2025.vaibhav@spo.iitk",
        "last_reminder_at": 1768583006590,
        "deadline": 0
    },
    {
        "ID": 12299,
        "CreatedAt": "2026-01-16T16:30:16.193144Z",
        "UpdatedAt": "2026-01-16T16:30:26.307944Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "PPT& Interview - Spotnana",
        "description": "<p>PPT AND Interviews for Spotnana is scheduled from 9 am on 17th Jan in TB201.<strong> IT IS MANDATORY FOR ALL SHORTLISTED CANDIDATES TO ATTEND THE PPT AS INTERVIEWS WILL START JUST AFTER THE PPT</strong></p>",
        "tags": "ppt,interview",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1768581026307,
        "deadline": 0
    },
    {
        "ID": 12278,
        "CreatedAt": "2026-01-14T04:38:05.646397Z",
        "UpdatedAt": "2026-01-14T04:38:27.135982Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Interview Shortlist - Spotnana",
        "description": "<p>PFB the interview shortlist. Interviews will be conducted on 17th Jan in Offline mode. Further details will be conveyed to shortlisted candidates.</p><p><a href=\"https://docs.google.com/spreadsheets/d/172KjUn8hZHtsppN8hxuGwp8534Z3YJ7p7Kxk_jMFuYY/edit?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://docs.google.com/spreadsheets/d/172KjUn8hZHtsppN8hxuGwp8534Z3YJ7p7Kxk_jMFuYY/edit?usp=sharing</a></p>",
        "tags": "Interview, Spotnana",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1768365507135,
        "deadline": 0
    },
    {
        "ID": 12276,
        "CreatedAt": "2026-01-13T13:06:39.395752Z",
        "UpdatedAt": "2026-01-13T13:06:47.74977Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Interview Shortlist - BHARAT ELECTRONICS LIMITED",
        "description": "<ol><li>Dushyant</li><li>Narravula Pavan Kalyan Reddy</li><li>Aviral Taneja</li><li>Sankar Reghunath</li><li>Navneet Singh</li><li>Tanmay Kumar Goyal</li><li>Vandana P</li><li>Shashi Kant</li><li>Parikh Shashwat Amit</li><li>Banavathu Sai P[hanendra Singh Rathod</li><li>Sagar Kumar</li><li>Dave Heet Mayurbhai</li><li>Abhijeet Shravansing Rajput</li><li>Arnika Kaithwas</li><li>Kanishk Sharma</li><li>Pushkar Vatsa</li></ol>",
        "tags": "Shortlist",
        "attachment": "",
        "created_by": "opc25.utkarsh@spo.iitk",
        "last_reminder_at": 1768309607749,
        "deadline": 0
    },
    {
        "ID": 12275,
        "CreatedAt": "2026-01-13T08:12:20.238774Z",
        "UpdatedAt": "2026-01-13T08:12:32.472429Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Venue - BHARAT ELECTRONICS LIMITED",
        "description": "<p>Test venue: DJAC205H</p><p>Time: 2 PM (today)</p>",
        "tags": "Test",
        "attachment": "",
        "created_by": "ac.2025.krish@spo.iitk",
        "last_reminder_at": 1768291952472,
        "deadline": 0
    },
    {
        "ID": 12274,
        "CreatedAt": "2026-01-13T04:28:09.922223Z",
        "UpdatedAt": "2026-01-13T04:28:20.736272Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Instructions  - BHARAT ELECTRONICS LIMITED",
        "description": "<p>All shortlisted students are required to carry the gate score cards as well</p>",
        "tags": "BEL",
        "attachment": "",
        "created_by": "ac.2025.krish@spo.iitk",
        "last_reminder_at": 1768278500736,
        "deadline": 0
    },
    {
        "ID": 12271,
        "CreatedAt": "2026-01-12T06:20:10.445554Z",
        "UpdatedAt": "2026-01-12T06:20:15.76705Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Instructions - BEL (PG) - BHARAT ELECTRONICS LIMITED",
        "description": "<p>Offline test has been scheduled for 13th January 2026, from 2:00 PM onwards.</p><p>All shortlisted candidates are required to be ready with all the mandatory documents (originals along with one set of photocopies) by 2:00 PM tomorrow. These documents will be verified prior to the test.</p>",
        "tags": "Test",
        "attachment": "",
        "created_by": "opc25.utkarsh@spo.iitk",
        "last_reminder_at": 1768198815766,
        "deadline": 0
    },
    {
        "ID": 12270,
        "CreatedAt": "2026-01-11T15:33:02.728543Z",
        "UpdatedAt": "2026-01-11T15:33:09.155473Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Interview Shortlist - Round 1 - 64squares",
        "description": "<p>PFA the interview shortlist for Round 1:</p><p><a href=\"https://docs.google.com/spreadsheets/d/1ONgiooo4UsXgC5hyweCCP6Mo9ZPZR9Yb6ENfHIv-i3U/edit?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://docs.google.com/spreadsheets/d/1ONgiooo4UsXgC5hyweCCP6Mo9ZPZR9Yb6ENfHIv-i3U/edit?usp=sharing</a></p>",
        "tags": "Interview, Shortlist",
        "attachment": "",
        "created_by": "ac.2025.vaibhav@spo.iitk",
        "last_reminder_at": 1768145589155,
        "deadline": 0
    },
    {
        "ID": 12269,
        "CreatedAt": "2026-01-11T07:27:34.76453Z",
        "UpdatedAt": "2026-01-11T07:27:49.805334Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Reminder For Test - Spotnana",
        "description": "<p>Reminder for the Spotnana Test scheduled at 1 PM in L20</p><p>Attendance is strictly mandatory otherwise strict actions will bee taken</p><p>Please come on time, Doors will be closed at 1:05 PM</p><p>Test Link have been mailed on your IIT K mail id</p>",
        "tags": "Test, Spotnana",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1768116469805,
        "deadline": 0
    },
    {
        "ID": 12268,
        "CreatedAt": "2026-01-11T06:31:41.857542Z",
        "UpdatedAt": "2026-01-11T06:32:54.519048Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Venue - Spotnana",
        "description": "<p>Venue for the Spotnana test is L20. Test will start sharp at 1:00 PM. It is strictly mandatory for all shortlisted candidates to attempt the test from lecture hall. Strict actions will be taken against the students who will not attend the test from lecture hall.</p>",
        "tags": "Test, Spotnana",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1768113174518,
        "deadline": 0
    },
    {
        "ID": 12267,
        "CreatedAt": "2026-01-11T05:34:28.225738Z",
        "UpdatedAt": "2026-01-11T05:34:33.085463Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Link - 64squares",
        "description": "<p>http://tinyurl.com/ljr7pa9</p><p>The test login window is open until 11:15 AM, so please ensure that you start the test before this time. No extensions will be provided later.</p>",
        "tags": "Test",
        "attachment": "",
        "created_by": "ac.2025.vaibhav@spo.iitk",
        "last_reminder_at": 1768109673085,
        "deadline": 0
    },
    {
        "ID": 12266,
        "CreatedAt": "2026-01-11T04:41:50.453267Z",
        "UpdatedAt": "2026-01-11T04:42:04.211536Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Details - 64squares",
        "description": "<p>All applicants are eligible to appear for the test.</p><p>Test Venue: L20</p><p>Test Timings: 11AM, 11 January 2025</p>",
        "tags": "Test",
        "attachment": "",
        "created_by": "ac.2025.vaibhav@spo.iitk",
        "last_reminder_at": 1768106524211,
        "deadline": 0
    },
    {
        "ID": 12265,
        "CreatedAt": "2026-01-10T14:12:48.602343Z",
        "UpdatedAt": "2026-01-10T14:15:21.607188Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Details - 64squares",
        "description": "<p>The test is scheduled for tomorrow, 11 January, at 11 AM.</p><p>All applicants are eligible to appear for the test.</p><p>Test Venue will be informed later.</p>",
        "tags": "Test",
        "attachment": "",
        "created_by": "ac.2025.vaibhav@spo.iitk",
        "last_reminder_at": 1768054521606,
        "deadline": 0
    },
    {
        "ID": 12264,
        "CreatedAt": "2026-01-09T18:47:12.498648Z",
        "UpdatedAt": "2026-01-09T18:47:27.912345Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Updated Timing  - Spotnana",
        "description": "<p>Updated Timing for Spotnana Test is 1pm-2:30pm on 11th Jan 2026</p>",
        "tags": "Timing Spotnana",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1767984447912,
        "deadline": 0
    },
    {
        "ID": 12263,
        "CreatedAt": "2026-01-09T17:37:34.361662Z",
        "UpdatedAt": "2026-01-09T17:37:58.900988Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Interview Shortlist and Instructions - K12 Techno Services Pvt Ltd",
        "description": "<p>PFB the interview shortlist</p><p><a href=\"https://docs.google.com/spreadsheets/d/1_B4lHAm3XEKOc3Tva8ygcUjjrKVYFuYiZyDY78zvjmw/edit?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://docs.google.com/spreadsheets/d/1_B4lHAm3XEKOc3Tva8ygcUjjrKVYFuYiZyDY78zvjmw/edit?usp=sharing</a></p><p>Each candidate must prepare a 10-minute brief demonstration on a topic of their choice from Physics, Chemistry, or Mathematics .The topic should be of 6th to 10th Class only. Interviews will be starting from 10:30 AM on 10th Jan. Venue is SPO Office(Outreach Building)</p><p>Candidates are required to be dressed in formal attire during the demonstration.</p>",
        "tags": "Shortlist, K12",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1767980278900,
        "deadline": 0
    },
    {
        "ID": 12262,
        "CreatedAt": "2026-01-09T15:13:11.79239Z",
        "UpdatedAt": "2026-01-09T15:14:05.052087Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Link - K12 Techno Services Pvt Ltd",
        "description": "<p>PFB the test link</p><p><a href=\"https://www.orchidsinternationalschool.com/test/ocfp-test/IITCampus2.4\" rel=\"noopener noreferrer\" target=\"_blank\">https://www.orchidsinternationalschool.com/test/ocfp-test/IITCampus2.4</a></p>",
        "tags": "Test ",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1767971645051,
        "deadline": 0
    },
    {
        "ID": 12261,
        "CreatedAt": "2026-01-09T12:50:58.104391Z",
        "UpdatedAt": "2026-01-09T12:51:10.192596Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "PPT and Test Venue - K12 Techno Services Pvt Ltd",
        "description": "<p>Reminder for PPT and Test scheduled for K12 Technoservices at 7 PM on 9th Jan. Venue is L15. Please reach the venue on time. Those who don't attend the PPT will not be allowed for test. Please bring laptops, pen and paper for the test.</p>",
        "tags": "PPT,Test, K12",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1767963070192,
        "deadline": 0
    },
    {
        "ID": 12260,
        "CreatedAt": "2026-01-09T07:07:52.322056Z",
        "UpdatedAt": "2026-01-09T07:07:57.826994Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Shortlist  - Spotnana",
        "description": "<p>Test for Spotnana is scheduled from 1 PM- 2:30 PM on 10th Jan. PFB the test shortlist. Venue will be conveyed soon</p><p><a href=\"https://docs.google.com/spreadsheets/d/1JFl7qQfKZ1WsQiU4TCv4y8oXsr3RWIZhkDNuv_8ZKSU/edit?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://docs.google.com/spreadsheets/d/1JFl7qQfKZ1WsQiU4TCv4y8oXsr3RWIZhkDNuv_8ZKSU/edit?usp=sharing</a></p>",
        "tags": "Test, Spotnana",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1767942477826,
        "deadline": 0
    },
    {
        "ID": 12259,
        "CreatedAt": "2026-01-09T07:01:55.862101Z",
        "UpdatedAt": "2026-01-09T07:02:15.931206Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test and PPT timings - K12 Techno Services Pvt Ltd",
        "description": "<p>PPT and Test for K12 Technoservices is scheduled from 7PM on 9th Jan i.e. today. All applicants are eligible for the test . It is mandatory to attend the PPT so please reach the lecture hall around 6:45PM. Venue will be conveyed soon.</p>",
        "tags": "Test and PPT",
        "attachment": "",
        "created_by": "ac.2025.piyush@spo.iitk",
        "last_reminder_at": 1767942135930,
        "deadline": 0
    },
    {
        "ID": 12258,
        "CreatedAt": "2026-01-08T19:21:50.126253Z",
        "UpdatedAt": "2026-01-08T19:22:01.459315Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Interview Shortlist and Timing - Bayer",
        "description": "<img src=\"timeline_images/timeline_img_31.jpg\">Here is the interview shortlist. The interviews will begin at 10:30 AM on 9th January(today). The venue is SPO. </span>",
        "tags": "Interview, Bayer",
        "attachment": "",
        "created_by": "ac.2025.devesh@spo.iitk",
        "last_reminder_at": 1767900121459,
        "deadline": 0
    },
    {
        "ID": 12257,
        "CreatedAt": "2026-01-08T14:44:47.655766Z",
        "UpdatedAt": "2026-01-08T14:47:08.809908Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "[Sigmoid Analytics] | New Job Opening for DS Trainee",
        "description": "A new opening has been created for the profile of DS Trainee in the company Sigmoid Analytics",
        "tags": "opening,IT / Software,Sigmoid Analytics",
        "attachment": "",
        "created_by": "ac.2025.vaibhav@spo.iitk",
        "last_reminder_at": 1767883628809,
        "deadline": 1768069740000
    },
    {
        "ID": 12255,
        "CreatedAt": "2026-01-08T11:34:15.838182Z",
        "UpdatedAt": "2026-01-08T11:35:13.670815Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test - Bayer",
        "description": "<p>The test will start from 8PM. So everyone has to reach the venue L17 by 7:30 PM. </p>",
        "tags": "Test, Bayer",
        "attachment": "",
        "created_by": "ac.2025.devesh@spo.iitk",
        "last_reminder_at": 1767872113670,
        "deadline": 0
    },
    {
        "ID": 12254,
        "CreatedAt": "2026-01-08T06:50:20.035642Z",
        "UpdatedAt": "2026-01-08T06:50:29.109059Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Updated Test Shortlist  - BHARAT ELECTRONICS LIMITED",
        "description": "<p>PFB the link for updated shortlist,</p><p><a href=\"https://docs.google.com/spreadsheets/d/1KZnD2KguUa4WZ2CfsmkgTzKr-SJj7tFY-8QRgki4BmA/edit?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://docs.google.com/spreadsheets/d/1KZnD2KguUa4WZ2CfsmkgTzKr-SJj7tFY-8QRgki4BmA/edit?usp=sharing</a></p><p>Test is sheduled on 12th January </p><p><span style=\"color: rgb(44, 54, 58);\">All the candidates are requested to bring all the required documents in Original and 1 (one) set of Photocopy mentioned below,</span></p><ol><li>Bio-Data Format</li><li>CGPA conversion form</li><li>Check list</li><li>Disability Certificate format</li><li>EWS certificate format</li><li>OBC(NCL) certificate format</li><li>SC &amp; ST certificate format</li><li>Undertaking M.Tech degree</li></ol><p>Note - Caste Certificate should be updated (FY 2025-26) issued for Central Govt jobs or in BEL given prescribed format.</p>",
        "tags": "Shortlist",
        "attachment": "",
        "created_by": "opc25.utkarsh@spo.iitk",
        "last_reminder_at": 1767855029108,
        "deadline": 0
    },
    {
        "ID": 12252,
        "CreatedAt": "2026-01-07T10:10:00.194987Z",
        "UpdatedAt": "2026-01-07T10:10:08.978331Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Test Instructions - Bayer",
        "description": "<p>Dear Students,</p><p>The test will conducted in offline mode. Please carry your laptops. Below are the test details:</p><p><strong>Date: </strong>8 January </p><p><strong>Time: </strong>8 PM</p><p><strong>Test Venue: </strong>LHC(exact hall will communicated)</p><p>PFB the test shortlist:</p><p><img src=\"timeline_images/timeline_img_32.jpg\"></p><p><br></p>",
        "tags": "Bayer, Test",
        "attachment": "",
        "created_by": "ac.2024.anushka@spo.iitk",
        "last_reminder_at": 1767780608978,
        "deadline": 0
    },
    {
        "ID": 12248,
        "CreatedAt": "2026-01-05T08:16:43.613552Z",
        "UpdatedAt": "2026-01-05T08:19:01.385477Z",
        "DeletedAt": None,
        "recruitment_cycle_id": 14,
        "title": "Deadline Extension - Spotnana",
        "description": "<p>Deadline for Spotnana is extended till 11:59 PM on 6th Jan.</p><p>PFB the details</p><p>Life at spotnana: <a href=\"https://drive.google.com/file/d/1j8Y8WkM_HAeodnMNum2Qcv026hsYTKth/view?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://drive.google.com/file/d/1j8Y8WkM_HAeodnMNum2Qcv026hsYTKth/view?usp=sharing</a></p><p>Updated JD: <a href=\"https://drive.google.com/file/d/17bOP_VbSoK6PcKr8MWa8gUoNOv1D_CRn/view?usp=sharing\" rel=\"noopener noreferrer\" target=\"_blank\">https://drive.google.com/file/d/17bOP_VbSoK6PcKr8MWa8gUoNOv1D_CRn/view?usp=sharing</a></p><p><strong>About Spotnana</strong>:&nbsp;<a href=\"https://www.spotnana.com/about/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(0, 172, 255); background-color: transparent;\">https://www.spotnana.com/about/</a></p><p><strong>Spotnana's Global Offsite - Converge 2025</strong>:&nbsp;<a href=\"https://www.spotnana.com/blog/offsite-converge-2025/\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(0, 172, 255); background-color: transparent;\">https://www.spotnana.com/blog/offsite-converge-2025/</a></p><p><strong>Spotnana's 2025 Year in Review on Social Media</strong>:&nbsp;<a href=\"https://tinyurl.com/32mmw269\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(0, 172, 255); background-color: transparent;\">https://tinyurl.com/32mmw269</a></p><p><strong>Working at Spotnana: Our people, mission, and culture</strong>:&nbsp;<a href=\"https://www.youtube.com/watch?v=x05s-hXnZ7o\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(0, 172, 255); background-color: transparent;\">https://www.youtube.com/watch?v=x05s-hXnZ7o</a></p>",
        "tags": "Deadline, Spotnana",
        "attachment": "",
        "created_by": "opc25.satvik@spo.iitk",
        "last_reminder_at": 1767601141385,
        "deadline": 0
    }
]

company_file = 'merged_company_data.json'
output_file = 'updated_merged_company_data.json'

def update_company_data():
    try:
        # Load existing data
        with open(company_file, 'r', encoding='utf-8') as f:
            companies = json.load(f)
            
        print(f"Loaded {len(companies)} company profiles.")

        # Identify unique company names for matching
        company_names = set()
        for c in companies:
            name = c.get('company_name', '').strip()
            if name:
                company_names.add(name)
        company_names = list(company_names)
        
        added_count = 0
        
        # Process new events
        for event in new_events_raw:
            title = event.get('title', '').strip()
            if not title:
                continue
            
            # Find Matches
            mentions = []
            for name in company_names:
                # Regex for whole word or boundary match
                # e.g. "Bayer" in "Test - Bayer"
                pattern = r'(?:^|\W)' + re.escape(name) + r'(?:$|\W)'
                if re.search(pattern, title, re.IGNORECASE):
                    mentions.append(name)
            
            # Filter Substrings
            final_matches = []
            for m1 in mentions:
                is_substring = False
                for m2 in mentions:
                    if m1 != m2 and m1.lower() in m2.lower():
                        is_substring = True
                        break
                if not is_substring:
                    final_matches.append(m1)
            
            # Add to Companies
            if final_matches:
                event_obj = {
                    "title": event.get('title'),
                    "description": event.get('description'),
                    "created_at": event.get('CreatedAt'),
                    "id": event.get('ID')
                }
                
                for comp in companies:
                    c_name = comp.get('company_name', '').strip()
                    if c_name in final_matches:
                        # Check for duplicates using ID
                        existing_ids = [e.get('id') for e in comp.get('timeline_events', [])]
                        if event_obj['id'] not in existing_ids:
                            # Initialize if missing (though unlikely in merged data)
                            if 'timeline_events' not in comp:
                                comp['timeline_events'] = []
                            comp['timeline_events'].append(event_obj)
                            added_count += 1
                        else:
                            # If exists, maybe update? User said "correct... discrepancies"
                            # Let's overwrite the existing event with the new one to ensure latest info
                             for i, e in enumerate(comp['timeline_events']):
                                if e.get('id') == event_obj['id']:
                                    comp['timeline_events'][i] = event_obj
                                    # We don't increment added_count but we updated it
        
        # Sort timeline events by date (optional but good)
        for comp in companies:
            if 'timeline_events' in comp:
                comp['timeline_events'].sort(key=lambda x: x.get('created_at', ''), reverse=True)

        # Save
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(companies, f, indent=4)
            
        print(f"Update complete. Processed {len(new_events_raw)} new events.")
        print(f"Saved to {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")

update_company_data()