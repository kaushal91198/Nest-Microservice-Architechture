import { ping } from 'tcp-ping';

describe('Health', () => {
    test('Payments', (done) => {
        ping({ address: 'payments', port: 3003 }, (err) => {
            if (err) {
                fail();
            }
            done();
        });
    });

    test('Notifications', (done) => {
        ping({ address: 'notifications', port: 3004 }, (err) => {
            if (err) {
                fail();
            }
            done();
        });
    });
});
