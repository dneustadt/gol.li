<?php if (@$data['name']): ?>
    <h2>
        <?= @$data['name']; ?>
    </h2>
    <?php if (@$data['is_owner']): ?>
        <form action="<?= @$data['base_path']; ?>/<?= @$data['name']; ?>/update" method="post" class="service-form">
            <?php /** @var \Golli\Models\Service $service */ foreach (@$data['services'] as $service): ?>
                <div class="row">
                    <div class="column column-20">
                        <?= $service->getName() ?>
                    </div>
                    <div class="column url-pattern">
                        <?= sprintf(
                            $service->getUrl(),
                            '</div>' .
                            '<div class="column handle"><input type="text" name="services[' . $service->getId() . ']"></div>' .
                            '<div class="column url-pattern">'
                        ) ?>
                    </div>
                </div>
            <?php endforeach; ?>
            <button type="submit" class="float-right">Save</button>
        </form>
        <a href="<?= @$data['base_path']; ?>/logout" class="button">Logout</a>
    <?php endif; ?>
<?php else: ?>
    <?php if (!@$data['is_loggedin']): ?>
        <div class="row">
            <div class="column">
                <fieldset class="login-form">
                    <legend>Login:</legend>
                    <form action="<?= @$data['base_path']; ?>/login" method="post">
                        <div class="login-form--field">
                            <input placeholder="Username" type="text" id="login-username" name="_username" required>
                        </div>
                        <div class="login-form--field">
                            <input placeholder="Password" type="password" id="login-password" name="_password" required>
                        </div>
                        <div class="login-form--field">
                            <button type="submit">Login</button>
                        </div>
                    </form>
                </fieldset>
            </div>
            <div class="column">
                <?php include __DIR__ . '/../register/index.php'; ?>
            </div>
        </div>
    <?php else: ?>
        <h2>Hello <?= @$data['username']; ?>!</h2>
        <p>
            You're logged in. Head over to your <a href="<?= @$data['base_path']; ?>/<?= @$data['username']; ?>">profile</a>
            and manage your social media profiles.
        </p>
        <a href="<?= @$data['base_path']; ?>/logout" class="button">Logout</a>
    <?php endif; ?>
<?php endif; ?>
