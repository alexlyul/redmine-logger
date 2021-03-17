import { Selector, t } from 'testcafe'
import config from './config';

function getDatesBetween(d1, d2) {
    const days = []
    const oneDay = 24 * 3600 * 1000

    for (let ms = d1 * 1, last = d2 * 1; ms <= last; ms += oneDay) {
        const day = new Date(ms)
        if (day.getDay() !== 0 && day.getDay() !== 6) {
            days.push(day)
        }
    }

    return days
}


class TaskPage {
    constructor () {

        // inputs
        this.date = Selector('#time_entry_spent_on')
        this.hours = Selector('#time_entry_hours')
        this.googleEmail = Selector('input').withAttribute('type', 'email')
        this.googlePass = Selector('input').withAttribute('type', 'password')
        this.activity = Selector('#time_entry_activity_id')
        this.activityOption = this.activity.find('option');
        this.comment = Selector('#time_entry_comments');

        // buttons
        this.loginGoogle = Selector('div.button-login-text')
        this.googleNext = Selector('#identifierNext')
        this.googleNextPass = Selector('#passwordNext')
        this.createAndContinue = Selector('input[type="submit"]').withAttribute('name', 'continue')
    }

    async setDate (date) {
        await t.typeText(this.date, date)
    }

    async setHours (h = '8') {
        await t.typeText(this.hours, h)
    }

    async setActivity (activityText) {
        await t
            .click(this.activity)
            .click(this.activityOption.withText(activityText))
    }

    async setComment (c) {
        await t.typeText(this.comment, c)
    }


    async login (email, pass) {
        await t.click(this.loginGoogle)
        await t.typeText(this.googleEmail, email)
        await t.click(this.googleNext)
        await t.typeText(this.googlePass, pass)
        await t.click(this.googleNextPass)

        //login by hands
        await t.debug()
        await this.date()
    }
}

const taskPage = new TaskPage()

const {
    taskId,
    from,
    to,
    comment,
    activityText,
    email,
    pass,
    host,
} = config;



fixture`LogTime`.page`${host}/issues/${taskId}/time_entries/new`

test('logTime', async t => {
    await taskPage.login(email, pass)
    await taskPage.setActivity(activityText)

    const dateRanges = getDatesBetween(new Date(from), new Date(to))

    for (let i = 0; i< dateRanges.length; i++) {
        await taskPage.setDate(dateRanges[i].toISOString().split('T')[0])
        await taskPage.setHours()
        await taskPage.setComment(comment)
        await t.click(taskPage.createAndContinue)
    }

})
