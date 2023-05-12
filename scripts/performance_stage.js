import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

/* 
    Search for a crocodile by id
    Criteria:
        Performance Test
        - Ramp up 10 VUs for 10s
        - Load 10 VUs for 10s
        - Ramp down 0 VUs for 10s
    Thresholds(Limits)
        - Request success > 95%
        - Request time p(90) < 200ms
*/

export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '10s', target: 10 },
        { duration: '10s', target: 0 }
    ],
    thresholds: {
        checks: ['rate > 0.95'],
        http_req_duration: ['p(95) < 20000']
    },
    ext: {
        loadimpact: {
          projectID: 3640328,
          name: "PERFORMANCE LOAD TEST"
        }
      }
};

const data = new SharedArray('Json reading', function () {
    return JSON.parse(open('../data/data.json')).crocodiles
});

export default function () {
    const crocodile = data[Math.floor(Math.random() * data.length)].id

    const BASE_URL = `https://test-api.k6.io/public/crocodiles/${crocodile}`

    const res = http.get(BASE_URL)

    check(res, {
        'status code 200': (r) => r.status === 200
    });

    sleep(1)
}