import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

/* 
    Login with a new user
    Criteria:
        Stress Test
        - Ramp up 5 VUs for 5s
        - Load 5 VUs for 5s
        - Ramp up 50 VUs for 2s
        - Load 50 VUs for 2s
        - Ramp down 0 VUs for 5s
    Thresholds(Limits)
        - Request fail < 1%
*/

export const options = {
    stages: [
        { duration: '5s', target: 5 },
        { duration: '5s', target: 5 },
        { duration: '2s', target: 50 },
        { duration: '2s', target: 50 },
        { duration: '5s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate < 0.01']
    }
}

const csvData = new SharedArray('Ler dados', function () {
    return papaparse.parse(open('../data/users.csv'), { header: true }).data;
});

export default function () {
    const DATA = csvData[Math.floor(Math.random() * csvData.length)]
    const USER = DATA.user
    const PASS = DATA.password
    const BASE_URL = 'https://test-api.k6.io';

    const res = http.post(`${BASE_URL}/auth/token/login/`, {
        username: USER,
        password: PASS
    });

    check(res, {
        'Sucess status code 200': (r) => r.status === 200,
        'Generated token': (r) => r.json('access') != ''
    });

    sleep(1)
}