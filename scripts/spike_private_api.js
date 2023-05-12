import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";


/* 
    Search all crocodiles
    Criteria:
        Spike Test
        - Load 100 VUs for 2s
    Thresholds(Limits)
        - Request fail < 1%
        - Request time p(95) < 250ms
*/

export const options = {
    vus: 1,
    duration: '3s',
    thresholds: {
        http_req_failed: ['rate < 0.01'],
        http_req_duration: ['p(95) < 250']
    },
    ext: {
        loadimpact: {
          projectID: 3640329,
          name: "SPIKE TEST"
        }
      }
}

const BASE_URL = 'https://test-api.k6.io';

export function setup() {
    const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
        username: '0.5577608357004727@mail.com',
        password: 'user123'
    });
    const token = loginRes.json('access');
    return token;
}

export default function (token) {

    const params = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }
    const res = http.get(`${BASE_URL}/my/crocodiles`, params);

    check(res, {
        'status code 200': (r) => r.status === 200
    });
}

export function handleSummary(data) {
    return {
        "report_tests.html" : htmlReport(data)
    };
}