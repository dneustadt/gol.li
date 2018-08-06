<?php if (@$data['sent'] && empty(@$data['error'])): ?>
    <p>
        You successfully changed your password. Please head over to the
        <a href="<?= @$data['base_path']; ?>/" class="inline-link">home page</a> to log in
        with your new credentials.
    </p>
<?php else: ?>
    <div class="row">
        <div class="column">
            <fieldset class="reset-form">
                <legend>Set new password:</legend>
                <form action="<?= @$data['base_path']; ?>/login/password" method="post">
                    <div class="reset-form--field">
                        <input placeholder="Password" type="password" minlength="6" id="password" name="_password" required>
                    </div>
                    <?php if (@$data['error']['password']): ?>
                        <ul class="errors">
                            <li>Must at least contain 6 characters</li>
                        </ul>
                    <?php endif; ?>
                    <div class="reset-form--field">
                        <input placeholder="Confirm Password" type="password" minlength="6" id="password_confirm" name="_password_confirm" required>
                    </div>
                    <?php if (@$data['error']['password_confirm']): ?>
                        <ul class="errors">
                            <li>The provided passwords didn't match</li>
                        </ul>
                    <?php endif; ?>
                    <input type="hidden" name="_token" value="<?= @$data['token']; ?>">
                    <div class="reset-form--field">
                        <button type="submit">Set New Password</button>
                    </div>
                </form>
            </fieldset>
        </div>
        <div class="column"></div>
    </div>
<?php endif; ?>