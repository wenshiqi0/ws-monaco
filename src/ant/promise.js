import Promise from 'bluebird';

Promise.config({
  cancellation: true,
});

export function always (promise, f) {
  const bluebird = Promise.resolve(promise);
	return new Promise((c, e, p) => {
		bluebird.done((result) => {
			try {
				f(result);
			} catch (e1) {
        // errors.onUnexpectedError(e1);
        console.error(e1);
			}
			c(result);
		}, (err) => {
			try {
				f(err);
			} catch (e1) {
        // errors.onUnexpectedError(e1);
        console.error(e1);        
			}
			e(err);
		}, (progress) => {
			p(progress);
		});
	}, () => {
    bluebird.cancel();
	});
}

export function wireCancellationToken(token, promise, resolveAsUndefinedWhenCancelled) {
	const subscription = token.onCancellationRequested(() => promise.cancel());
	if (resolveAsUndefinedWhenCancelled) {
		promise = promise.then(undefined, err => {
			if (!errors.isPromiseCanceledError(err)) {
				return TPromise.wrapError(err);
			}
			return undefined;
		});
	}
	return always(promise, () => subscription.dispose());
}