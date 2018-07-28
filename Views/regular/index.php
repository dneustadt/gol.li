<?php if (@$data['name']): ?>
    <h2 class="username">
        <?= @$data['name']; ?>
    </h2>
    <?php if (@$data['is_owner']): ?>
        <form action="<?= @$data['base_path']; ?>/<?= @$data['name']; ?>/update" method="post" class="service-form">
            <?php foreach (@$data['services'] as $service): ?>
                <div class="row service">
                    <div class="column column-20">
                        <span class="service-icon">
                            <?php if (!empty($service['image'])): ?>
                                <img class="icon" src="<?= @$data['base_path']; ?><?= $service['image']; ?>" alt="<?= $service['name']; ?>">
                            <?php endif; ?>
                        </span>
                        <span class="service-name"><?= $service['name']; ?></span>
                    </div>
                    <div class="column url-pattern">
                        <?= sprintf(
                            $service['url'],
                            '</div>' .
                            '<div class="column handle">' .
                            '<input type="text" name="services[' . $service['id'] . ']" value="' . @$service['handle'] . '">' .
                            '</div>' .
                            '<div class="column url-pattern">'
                        ); ?>
                    </div>
                </div>
            <?php endforeach; ?>
            <button type="submit" class="float-right">Save</button>
        </form>
        <a href="<?= @$data['base_path']; ?>/logout" class="button">Logout</a>
    <?php else: ?>
        <?php foreach (@$data['services'] as $service): ?>
            <div class="row service front">
                <div class="column column-33">
                    <span class="service-icon">
                        <?php if (!empty($service['image'])): ?>
                            <img class="icon" src="<?= @$data['base_path']; ?><?= $service['image']; ?>" alt="<?= $service['name']; ?>">
                        <?php endif; ?>
                    </span>
                    <span class="service-name"><?= $service['name']; ?></span>
                </div>
                <div class="column">
                    <a href="<?= sprintf($service['url'], $service['handle']); ?>" target="_blank">
                        <?= sprintf($service['url'], $service['handle']); ?>
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
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
